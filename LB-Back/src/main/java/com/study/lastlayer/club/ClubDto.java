package com.study.lastlayer.club;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class ClubDto {
	private Long id;
	private String description;
	private String keywords;
	private String name;
	private Long bgFileId;
	private String filename;
	private Long managerId;
	private LocalDateTime createdAt;
	

}
