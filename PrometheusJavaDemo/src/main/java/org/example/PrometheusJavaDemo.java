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

import java.io.FileOutputStream;
import java.io.PrintStream;

@SpringBootApplication
@RestController
public class PrometheusJavaDemo {

    private static final Counter requestCount = Counter.builder()
            .name("requests_total")
            .register();

    public static void main(String[] args) {
        String logFile = System.getenv("log_file");
        if(logFile != null) {
            System.out.println("Sending STDOUT logs to " + logFile);
            try {
                System.setOut(new PrintStream(new FileOutputStream(logFile, true)));
            } catch (Exception e) {
                System.out.println("Logs output error to " + logFile + " is :" + e.getMessage());
            }
        }
        SpringApplication.run(PrometheusJavaDemo.class, args);
        JvmMetrics.builder().register();
    }

    @GetMapping("/")
    public String sayHello() throws InterruptedException {
        requestCount.inc();
        String message = "Hello, World, " + System.currentTimeMillis() % 1000 + "!\n";
        System.out.println(message);
        return message;
    }

    @Bean
    public ServletRegistrationBean<PrometheusMetricsServlet> createPrometheusMetricsEndpoint() {
        return new ServletRegistrationBean<>(new PrometheusMetricsServlet(), "/metrics/*");
    }
}