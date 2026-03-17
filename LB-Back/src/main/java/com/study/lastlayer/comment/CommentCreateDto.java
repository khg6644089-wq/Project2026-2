package com.study.lastlayer.comment;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentCreateDto {
	private String profileFilename; 
    private String content;

}