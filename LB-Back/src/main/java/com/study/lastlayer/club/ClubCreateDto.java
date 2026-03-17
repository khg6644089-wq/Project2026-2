package com.study.lastlayer.club;

import org.springframework.web.multipart.MultipartFile;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClubCreateDto {

    private String name;
    private String description;
    private String keywords;
    private MultipartFile file;
}