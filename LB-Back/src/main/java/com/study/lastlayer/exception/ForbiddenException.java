package com.study.lastlayer.exception;

public class ForbiddenException extends RuntimeException {
	private static final long serialVersionUID = 1L;

	public ForbiddenException(String message) {
		super(message);
	}
}