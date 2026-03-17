package com.study.lastlayer.like;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LikeDto {
    private Long boardId;
    private Long memberId;
    private boolean liked; // 좋아요 성공(true) / 취소(false)
}