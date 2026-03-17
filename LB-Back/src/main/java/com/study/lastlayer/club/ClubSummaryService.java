package com.study.lastlayer.club;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClubSummaryService {

    private final ClubRepository clubRepository;
//전체
    public List<ClubSummaryDto> getClubSummaryList() {
        return clubRepository.findClubSummaryList();
    }
//단일
    public ClubSummaryDto getClubSummaryById(Long clubId) {
        return clubRepository.findClubSummaryById(clubId);
    }


}