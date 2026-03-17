package com.study.lastlayer.club;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ClubSummaryDto {

    private Long id;
    private String name;
    private String description;
    private String keywords;

    private Long bgFileId;
    private String filename;

    private Long managerId;
    private String managerName;

    private LocalDateTime createdAt;

    private Long memberCount;
    private Long boardCount;
}