package com.study.lastlayer.weekhistory;

import java.time.LocalDate;

public class WeekHistoryDto {
	
	public static record WeekHistoryRequest(String date, Float weight) {}
	public static record WeekHistoryUpdateRequest(Float weight) {}
	public static record WeekHistoryResponse(Long id, String date, Float weight, String message) {
		public WeekHistoryResponse(WeekHistory entity, String message) {
			this(entity.getId(), entity.getDate().toString(), entity.getWeight(), message);
		}
	}
	
	public static record WeekHistoryListResponse(Long id, String date, Float weight) {
		public WeekHistoryListResponse(WeekHistory entity) {
			this(entity.getId(), entity.getDate().toString(), entity.getWeight());
		}
	}

}
