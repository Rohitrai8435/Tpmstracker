package com.tpmstracker
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.Call
import com.google.gson.JsonObject
interface ApiSet {
    
      @POST("home_data")
    fun getHomeData(
        @Body params: HomeRequest
    ):  Call<JsonObject>

}
