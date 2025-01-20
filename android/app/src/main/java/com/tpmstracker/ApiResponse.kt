package com.tpmstracker

data class HomeDataResponse(
    val alarms: List<Alarm>
)
data class Alarm(
    val id: String,
    val message: String
)