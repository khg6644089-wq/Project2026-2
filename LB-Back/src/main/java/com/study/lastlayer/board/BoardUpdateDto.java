package com.study.lastlayer.board;

import org.springframework.web.multipart.MultipartFile;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class BoardUpdateDto {

    private String title;
    private String contents;
    private Integer boardType;
    private MultipartFile file; // 새 파일로 교체 시 사용 (선택)
}