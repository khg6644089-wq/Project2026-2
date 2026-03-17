package com.study.lastlayer.clubmember;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubMemberDto {
    private Long clubId;
    private String clubName;
    private String clubDescription;
    private String keywords;
    private String managerName; 
    
    private Long bgFileId;
    private String filename;
    
    private LocalDateTime createdAt;
}