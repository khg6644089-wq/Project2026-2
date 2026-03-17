package com.study.lastlayer.externapi;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class FastApiClient {
	private final String apiPrefix;
	private final RestTemplate restTemplate;

	// 생성자 주입 방식 (가장 권장됨)
	public FastApiClient(@Value("${external.fastapi.prefix}") String apiPrefix,
			@Value("${external.fastapi.connect-timeout}") int connectTimeout,
			@Value("${external.fastapi.read-timeout}") int readTimeout, RestTemplateBuilder builder) {

		this.apiPrefix = apiPrefix;
		this.restTemplate = builder.requestFactory(() -> {
			SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
			factory.setConnectTimeout(connectTimeout);
			factory.setReadTimeout(readTimeout);
			return factory;
		}).build();
	}

	public String getFullUrl(String addr) {
		String base = apiPrefix.endsWith("/") ? apiPrefix : apiPrefix + "/";
		String target = addr.startsWith("/") ? addr.substring(1) : addr;
		return base + target;
	}

	public RestTemplate getRestTemplate() {
		return this.restTemplate;
	}
}
