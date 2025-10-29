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

@SpringBootApplication
@RestController
public class PrometheusJavaDemo {

    private static final Counter requestCount = Counter.builder()
            .name("requests_total")
            .register();

    public static void main(String[] args) {
        SpringApplication.run(PrometheusJavaDemo.class, args);
        JvmMetrics.builder().register();
    }

    @GetMapping("/")
    public String sayHello() throws InterruptedException {
        requestCount.inc();
        return "Hello, World!\n";
    }

    @Bean
    public ServletRegistrationBean<PrometheusMetricsServlet> createPrometheusMetricsEndpoint() {
        return new ServletRegistrationBean<>(new PrometheusMetricsServlet(), "/metrics/*");
    }
}