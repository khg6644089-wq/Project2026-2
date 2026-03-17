package com.study.lastlayer.exception;

public class ErrorResponse {
	private final int status;
	private final String message;

	public ErrorResponse(int status, String message) {
		this.status = status;
		this.message = message;
	}

	// Getter 메소드를 추가해야 JSON 직렬화가 가능합니다.
	public int getStatus() {
		return status;
	}

	public String getMessage() {
		return message;
	}
}
