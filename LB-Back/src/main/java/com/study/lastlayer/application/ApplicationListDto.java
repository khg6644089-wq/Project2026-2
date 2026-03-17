package com.study.lastlayer.application;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ApplicationListDto {

    private Long applicationId;
    private Long memberId;
    private String memberName;
    private ApplicationStatus status;
}