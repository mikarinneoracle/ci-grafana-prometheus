package org.example;

import io.prometheus.metrics.core.metrics.Counter;
import io.prometheus.metrics.exporter.servlet.jakarta.PrometheusMetricsServlet;
import io.prometheus.metrics.instrumentation.jvm.JvmMetrics;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.net.DatagramSocket;
import java.net.InetAddress;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
@RestController
public class PrometheusJavaDemo {

    private int i = 0;
    private static final Counter requestCount = Counter.builder()
            .name("requests_total")
            .register();
    private static final Logger logger = LoggerFactory.getLogger(PrometheusJavaDemo.class);

    public static void main(String[] args) {
        SpringApplication.run(PrometheusJavaDemo.class, args);
        JvmMetrics.builder().register();
    }

    @GetMapping("/")
    public String sayHello() throws InterruptedException {
        requestCount.inc();
        String ip = "";
        try(final DatagramSocket socket = new DatagramSocket()){
            socket.connect(InetAddress.getByName("8.8.8.8"), 10002);
            ip = socket.getLocalAddress().getHostAddress();
        } catch (Exception e)
        {
            logger.info(e.getMessage());
        }
        i++;
        String message = "";
        if(i == 1)
        {
            //message = "Hello " + i + " <br>ip = " + ip;
            message = "CI just got refreshed! Hello " + i + " <br>ip = " + ip;
        } else {
            message = "Hello " + i + " <br>ip = " + ip;
        }
        logger.info(message);
        return message;
    }

    @Bean
    public ServletRegistrationBean<PrometheusMetricsServlet> createPrometheusMetricsEndpoint() {
        return new ServletRegistrationBean<>(new PrometheusMetricsServlet(), "/metrics/*");
    }
}