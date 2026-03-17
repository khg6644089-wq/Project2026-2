package com.study.lastlayer.clubmember;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubMemberSimpleDto {

    private Long id;
    private Long clubId;
    private Long memberId;
}