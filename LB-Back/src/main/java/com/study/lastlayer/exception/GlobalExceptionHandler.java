package com.study.lastlayer.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
	@ExceptionHandler(BadRequestException.class)
	public ResponseEntity<ErrorResponse> handleBadRequestException(BadRequestException ex) {
		// HTTP 상태 코드를 400 BAD_REQUEST로 지정
		HttpStatus status = HttpStatus.BAD_REQUEST;

		// 클라이언트에게 반환할 응답 객체 (원하는 메시지 포함)
		ErrorResponse errorResponse = new ErrorResponse(status.value(), ex.getMessage());

		return new ResponseEntity<>(errorResponse, status);
	}

	// [추가] 403 Forbidden: 권한 부족 (예: 방장이 아닌데 방장 API 호출)
	@ExceptionHandler(ForbiddenException.class)
	public ResponseEntity<ErrorResponse> handleForbiddenException(Exception ex) {
		HttpStatus status = HttpStatus.FORBIDDEN;

		ErrorResponse errorResponse = new ErrorResponse(status.value(), ex.getMessage());

		return new ResponseEntity<>(errorResponse, status);
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
		HttpStatus status = HttpStatus.BAD_REQUEST;
		ErrorResponse errorResponse = new ErrorResponse(status.value(), ex.getMessage());
		return new ResponseEntity<>(errorResponse, status);
	}
}