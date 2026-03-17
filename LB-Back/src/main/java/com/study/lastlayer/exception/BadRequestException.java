package com.study.lastlayer.exception;

public class BadRequestException extends RuntimeException {
	// 다음 에러 방지: The serializable class BadRequestException does not declare a static final serialVersionUID field of type long
	private static final long serialVersionUID = 1L;

	public BadRequestException(String message) {
		super(message);
	}

}
