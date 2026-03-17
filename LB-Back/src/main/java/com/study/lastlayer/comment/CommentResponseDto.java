package com.study.lastlayer.comment;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CommentResponseDto {

    private Long id;
    private Long memberId;
    private String memberName;
    private String profileFilename; 
    private String content;
    private LocalDateTime createdAt;

}