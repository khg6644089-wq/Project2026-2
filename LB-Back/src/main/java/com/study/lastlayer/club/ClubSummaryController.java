package com.study.lastlayer.club;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/clubsummaries")
public class ClubSummaryController {

    private final ClubSummaryService clubSummaryService;

    //전체
    @GetMapping
    public List<ClubSummaryDto> getClubSummaries() {
        return clubSummaryService.getClubSummaryList();
    }
    
    //단건
    @GetMapping("/{id}")
    public ClubSummaryDto getClubSummary(@PathVariable("id") Long id) {
        return clubSummaryService.getClubSummaryById(id);
    }
}