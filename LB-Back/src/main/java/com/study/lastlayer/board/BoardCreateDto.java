package com.study.lastlayer.board;

import org.springframework.web.multipart.MultipartFile;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class BoardCreateDto {
    private Long clubId;
    private String title;
    private String contents;
    private Integer boardType; // 1: 일반, 2: 공지
    private MultipartFile file; // 선택 사항
    private String memberName; 
}