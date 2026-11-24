package com.cesposhere.habittracker

import android.content.Context
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.updateAll
import androidx.glance.appwidget.state.updateAppWidgetState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@CapacitorPlugin(name = "WidgetBridge")
class WidgetBridgePlugin : Plugin() {

    @PluginMethod
    fun syncWidgetData(call: PluginCall) {
        val prefs = context.getSharedPreferences("habit_widget_prefs", Context.MODE_PRIVATE)
        prefs.edit()
            .putString("habits_json", call.getString("habitsJson", "[]"))
            .putString("date", call.getString("date", ""))
            .putString("uid", call.getString("uid", ""))
            .putString("project_id", call.getString("projectId", ""))
            .putString("api_key", call.getString("apiKey", ""))
            .putString("id_token", call.getString("idToken", ""))
            .putString("refresh_token", call.getString("refreshToken", ""))
            .commit()

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val manager = GlanceAppWidgetManager(context)
                manager.getGlanceIds(HabitWidget::class.java).forEach { glanceId ->
                    updateAppWidgetState(context, glanceId) {
                        it[RefreshTickKey] = System.currentTimeMillis()
                    }
                }
                HabitWidget().updateAll(context)
            } catch (_: Exception) {
                // A widget may not be placed yet or the launcher may be unavailable.
            }
        }
        call.resolve()
    }
}