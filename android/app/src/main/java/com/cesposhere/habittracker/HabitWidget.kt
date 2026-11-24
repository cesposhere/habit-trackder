package com.cesposhere.habittracker

import android.content.Context
import android.graphics.Color as AndroidColor
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.action.ActionParameters
import androidx.glance.action.actionParametersOf
import androidx.glance.action.clickable
import androidx.glance.currentState
import androidx.glance.LocalSize
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.action.ActionCallback
import androidx.glance.appwidget.action.actionRunCallback
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.lazy.LazyColumn
import androidx.glance.appwidget.lazy.items
import androidx.glance.appwidget.provideContent
import androidx.glance.appwidget.state.updateAppWidgetState
import androidx.glance.background
import androidx.glance.layout.*
import androidx.datastore.preferences.core.Preferences
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import androidx.datastore.preferences.core.longPreferencesKey
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.time.Instant

data class WidgetHabit(
    val id: String,
    val name: String,
    val color: String,
    val completed: Boolean
)

val HabitIdKey = ActionParameters.Key<String>("habit_id")
val RefreshTickKey = longPreferencesKey("refresh_tick")

class HabitWidget : GlanceAppWidget() {

    override val sizeMode = SizeMode.Exact

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            val refreshTick = currentState<Preferences>()[RefreshTickKey] ?: 0L
            val widgetSize = LocalSize.current
            val prefs = context.getSharedPreferences("habit_widget_prefs", Context.MODE_PRIVATE)
            val rawJson = if (refreshTick >= 0L) {
                prefs.getString("habits_json", "[]") ?: "[]"
            } else {
                "[]"
            }
            val habits = parseHabits(rawJson)
            val columns = if (widgetSize.width >= 240.dp) 3 else 2
            val horizontalPadding = 20.dp
            val columnGap = 8.dp
            val boxSize = (
                (widgetSize.width - horizontalPadding - columnGap * (columns - 1)) / columns
            ).coerceIn(64.dp, 110.dp)

            Column(
                modifier = GlanceModifier
                    .fillMaxSize()
                    .background(Color(0xFF0F1115))
                    .cornerRadius(20.dp)
                    .padding(10.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                if (habits.isEmpty()) {
                    Box(
                        modifier = GlanceModifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Open app to sync habits",
                            style = TextStyle(color = ColorProvider(Color(0xFF6B7280)), fontSize = 13.sp)
                        )
                    }
                } else {
                    LazyColumn(modifier = GlanceModifier.fillMaxSize()) {
                        items(habits.chunked(columns)) { rowHabits ->
                            Row(
                                modifier = GlanceModifier.fillMaxWidth().padding(vertical = 4.dp)
                            ) {
                                rowHabits.forEach { habit ->
                                    val accent = try {
                                        Color(AndroidColor.parseColor(habit.color))
                                    } catch (_: Exception) {
                                        Color(0xFF10B981)
                                    }

                                    Box(
                                        modifier = GlanceModifier
                                            .size(boxSize)
                                            .background(if (habit.completed) accent else Color(0xFF181C23))
                                            .cornerRadius(12.dp)
                                            .clickable(
                                                actionRunCallback<ToggleHabitAction>(
                                                    actionParametersOf(HabitIdKey to habit.id)
                                                )
                                            )
                                            .padding(8.dp),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Column(
                                            horizontalAlignment = Alignment.CenterHorizontally,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            if (habit.completed) {
                                                Text(
                                                    text = "✓",
                                                    style = TextStyle(
                                                        color = ColorProvider(Color.White),
                                                        fontSize = 20.sp,
                                                        fontWeight = FontWeight.Bold
                                                    )
                                                )
                                            }
                                            Text(
                                                text = habit.name,
                                                style = TextStyle(
                                                    color = ColorProvider(
                                                        if (habit.completed) Color.White else Color(0xFFF3F4F6)
                                                    ),
                                                    fontSize = 13.sp,
                                                    fontWeight = if (habit.completed) FontWeight.Bold else FontWeight.Normal
                                                ),
                                                maxLines = 2
                                            )
                                        }
                                    }
                                    if (habit !== rowHabits.last()) {
                                        Spacer(modifier = GlanceModifier.width(8.dp))
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private fun parseHabits(raw: String): List<WidgetHabit> {
        val list = mutableListOf<WidgetHabit>()
        val arr = try {
            JSONArray(raw)
        } catch (_: Exception) {
            return emptyList()
        }

        for (i in 0 until arr.length()) {
            try {
                val obj = arr.getJSONObject(i)
                val id = obj.optString("id")
                val name = obj.optString("name")
                if (id.isNotEmpty() && name.isNotEmpty()) {
                    list.add(
                        WidgetHabit(
                            id = id,
                            name = name,
                            color = obj.optString("color", "#10B981"),
                            completed = obj.optBoolean("completed", false)
                        )
                    )
                }
            } catch (_: Exception) {
                // Skip malformed entries without breaking the whole widget.
            }
        }
        return list
    }
}

class HabitWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = HabitWidget()
}

class ToggleHabitAction : ActionCallback {
    override suspend fun onAction(
        context: Context,
        glanceId: GlanceId,
        parameters: ActionParameters
    ) {
        val habitId = parameters[HabitIdKey] ?: return
        val prefs = context.getSharedPreferences("habit_widget_prefs", Context.MODE_PRIVATE)
        val raw = prefs.getString("habits_json", "[]") ?: "[]"
        val arr = JSONArray(raw)
        var newCompleted = true

        // 1. Instant local flip
        for (i in 0 until arr.length()) {
            val obj = arr.getJSONObject(i)
            if (obj.getString("id") == habitId) {
                newCompleted = !obj.optBoolean("completed", false)
                obj.put("completed", newCompleted)
                break
            }
        }
        prefs.edit().putString("habits_json", arr.toString()).commit()
        updateAppWidgetState(context, glanceId) {
            it[RefreshTickKey] = System.currentTimeMillis()
        }
        HabitWidget().update(context, glanceId)

        // 2. Sync to Firestore in background
        CoroutineScope(Dispatchers.IO).launch {
            syncLogToFirestore(context, habitId, newCompleted)
        }
    }

    private fun syncLogToFirestore(context: Context, habitId: String, completed: Boolean) {
        val prefs = context.getSharedPreferences("habit_widget_prefs", Context.MODE_PRIVATE)
        val projectId = prefs.getString("project_id", "") ?: return
        val uid = prefs.getString("uid", "") ?: return
        val date = prefs.getString("date", "") ?: return
        var idToken = prefs.getString("id_token", "") ?: return
        val apiKey = prefs.getString("api_key", "") ?: ""
        val refreshToken = prefs.getString("refresh_token", "") ?: ""

        if (projectId.isEmpty() || uid.isEmpty() || date.isEmpty()) return

        val status = patchFirestoreDoc(projectId, uid, habitId, date, completed, idToken)
        // If token expired (401), refresh it and retry once
        if (status == 401 && apiKey.isNotEmpty() && refreshToken.isNotEmpty()) {
            val freshToken = refreshFirebaseToken(apiKey, refreshToken) ?: return
            prefs.edit().putString("id_token", freshToken).apply()
            patchFirestoreDoc(projectId, uid, habitId, date, completed, freshToken)
        }
    }

    private fun patchFirestoreDoc(
        projectId: String,
        uid: String,
        habitId: String,
        date: String,
        completed: Boolean,
        idToken: String
    ): Int {
        val docId = "${habitId}_${date}"
        val endpoint = "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents/users/$uid/logs/$docId"
        val body = JSONObject().put(
            "fields", JSONObject()
                .put("habitId", JSONObject().put("stringValue", habitId))
                .put("date", JSONObject().put("stringValue", date))
                .put("completed", JSONObject().put("booleanValue", completed))
                .put("updatedAt", JSONObject().put("timestampValue", Instant.now().toString()))
        ).toString()

        val conn = (URL(endpoint).openConnection() as HttpURLConnection).apply {
            requestMethod = "PATCH"
            setRequestProperty("Authorization", "Bearer $idToken")
            setRequestProperty("Content-Type", "application/json")
            doOutput = true
            outputStream.use { it.write(body.toByteArray()) }
        }
        return try { conn.responseCode } finally { conn.disconnect() }
    }

    private fun refreshFirebaseToken(apiKey: String, refreshToken: String): String? {
        val endpoint = "https://securetoken.googleapis.com/v1/token?key=$apiKey"
        val payload = "grant_type=refresh_token&refresh_token=$refreshToken"
        val conn = (URL(endpoint).openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            setRequestProperty("Content-Type", "application/x-www-form-urlencoded")
            doOutput = true
            outputStream.use { it.write(payload.toByteArray()) }
        }
        return try {
            if (conn.responseCode == 200) {
                val res = conn.inputStream.bufferedReader().readText()
                JSONObject(res).optString("id_token").takeIf { it.isNotEmpty() }
            } else null
        } finally {
            conn.disconnect()
        }
    }
}