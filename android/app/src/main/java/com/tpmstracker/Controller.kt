package com.tpmstracker
import com.tpmstracker.ApiSet
import android.content.Context
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.io.InputStream
import java.security.KeyStore
import java.security.cert.CertificateFactory
import java.security.cert.X509Certificate
import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManager
import javax.net.ssl.X509TrustManager
import java.security.SecureRandom
import java.util.concurrent.TimeUnit

class Controller private constructor(val context: Context) {

    companion object {
        private const val BASE_URL = "https://dashboard.shrotitele.com/homesecurity/HomeSecurityApi/"

        @Volatile
        private var instance: Controller? = null

        private var retrofit: Retrofit? = null

        fun getInstance(context: Context): Controller {
            return instance ?: synchronized(this) {
                instance ?: Controller(context).also { instance = it }
            }
        }
    }

    init {
        val sslContext = createSslContext()

        val client = OkHttpClient.Builder()
            .sslSocketFactory(sslContext.socketFactory, createTrustManager())
            .connectTimeout(300, TimeUnit.SECONDS)
            .readTimeout(300, TimeUnit.SECONDS)
            .writeTimeout(300, TimeUnit.SECONDS)
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            })
            .build()

        retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .client(client)
            .build()
    }

    fun getApi(): ApiSet {
        return retrofit!!.create(ApiSet::class.java)
    }

    private fun createSslContext(): SSLContext {
        val sslContext = SSLContext.getInstance("TLS")
        sslContext.init(null, arrayOf(createTrustManager()), SecureRandom())
        return sslContext
    }

    private fun createTrustManager(): X509TrustManager {
        val cf = CertificateFactory.getInstance("X.509")
        val caInput: InputStream = context.assets.open("dashboard.pem") // 'context' is now passed into the class
        val cert = cf.generateCertificate(caInput) as X509Certificate
        caInput.close()
        val keyStore = KeyStore.getInstance(KeyStore.getDefaultType())
        keyStore.load(null, null)
        keyStore.setCertificateEntry("dashboard", cert)
        val tmf = javax.net.ssl.TrustManagerFactory.getInstance(javax.net.ssl.TrustManagerFactory.getDefaultAlgorithm())
        tmf.init(keyStore)
        return tmf.trustManagers[0] as X509TrustManager
    
    }
}
