package com.tpmstracker
import android.content.Intent;
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.tpmstracker.Controller
import com.facebook.react.bridge.*
import com.google.gson.JsonObject

@ReactModule(name = ApiService.NAME)
class ApiService(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "ApiService"
    }

    override fun getName(): String {
        return NAME
    }

    private fun getDeviceAttributesWithParams(params: ReadableMap): WritableMap {
        val attributes: WritableMap = Arguments.createMap()

        attributes.putString("manufacturer", android.os.Build.MANUFACTURER)
        attributes.putString("model", android.os.Build.MODEL)
        attributes.putString("osVersion", android.os.Build.VERSION.RELEASE)
        attributes.putString("deviceId", android.provider.Settings.Secure.getString(
            reactApplicationContext.contentResolver,
            android.provider.Settings.Secure.ANDROID_ID
        ))

        val customKey = params.getString("customKey") ?: "defaultKey"
        attributes.putString("customKey", customKey)

        return attributes
    }

@ReactMethod
fun getAttributesFromReact(params: ReadableMap, promise: Promise) {
    try {
      
        val imei = params.getString("imei") ?: throw IllegalArgumentException("IMEI is required")
        val request = HomeRequest(imei = imei)

        val call = Controller.getInstance(reactApplicationContext).getApi().getHomeData(request)

        call.enqueue(object : retrofit2.Callback<JsonObject> {
            override fun onResponse(
                call: retrofit2.Call<JsonObject>,
                response: retrofit2.Response<JsonObject>
            ) {
                if (response.isSuccessful) {
                    val jsonResponse = response.body()
                    if (jsonResponse != null) {
    
                        val readableMap = convertJsonObjectToReadableMap(jsonResponse)

                        promise.resolve(readableMap)
                    } else {
                        promise.reject("API_ERROR", "Response body is null")
                    }
                } else {
                    promise.reject(
                        "API_ERROR",
                        "API returned error: ${response.errorBody()?.string()}"
                    )
                }
            }

            override fun onFailure(call: retrofit2.Call<JsonObject>, t: Throwable) {
                promise.reject("NETWORK_ERROR", "Failed to connect: ${t.message}", t)
            }
        })
    } catch (e: Exception) {
        promise.reject("ERROR", "An error occurred: ${e.message}", e)
    }
}

fun convertJsonObjectToReadableMap(jsonObject: JsonObject): ReadableMap {
    val readableMap = Arguments.createMap()

    for (entry in jsonObject.entrySet()) {
        val key = entry.key
        val value = entry.value

        when {
            value.isJsonObject -> {
                val nestedMap = convertJsonObjectToReadableMap(value.asJsonObject)
                readableMap.putMap(key, nestedMap)
            }
            value.isJsonArray -> {
                val array = Arguments.createArray()
                for (item in value.asJsonArray) {
            
                    if (item.isJsonObject) {
                        val nestedMap = convertJsonObjectToReadableMap(item.asJsonObject)
                        array.pushMap(nestedMap)
                    } else if (item.isJsonPrimitive) {
                      
                        if (item.asJsonPrimitive.isString) {
                            array.pushString(item.asString)
                        } else if (item.asJsonPrimitive.isNumber) {
                            array.pushDouble(item.asDouble)
                        } else if (item.asJsonPrimitive.isBoolean) {
                            array.pushBoolean(item.asBoolean)
                        }
                    }
                }
                readableMap.putArray(key, array)
            }
            value.isJsonPrimitive -> {
                when {
                    value.asJsonPrimitive.isString -> readableMap.putString(key, value.asString)
                    value.asJsonPrimitive.isBoolean -> readableMap.putBoolean(key, value.asBoolean)
                    value.asJsonPrimitive.isNumber -> readableMap.putDouble(key, value.asDouble)
                }
            }
            else -> {
            }
        }
    }

    return readableMap
}




}