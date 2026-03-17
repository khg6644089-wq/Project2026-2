package com.study.lastlayer.board;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BoardDto {

    private Long id;
    private Integer board_type;
    private String contents;
    private LocalDateTime createdAt;
    private LocalDateTime deletedAt;
    private Integer like_count;
    private String title;
    private LocalDateTime updatedAt;
    private Integer view_count;
    private Long club_id;
    private Long file_id;
    private String filename;
    private Long member_id;

    // 조인조건
    private String member_name;
    private String profile_filename;
}
