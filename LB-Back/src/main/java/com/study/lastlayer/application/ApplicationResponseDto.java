package com.study.lastlayer.application;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ApplicationResponseDto {

    private Long applicationId;

    private Long memberId;
    private String memberName;

    private Long clubId;
    private String clubName;

    private ApplicationStatus status;
}