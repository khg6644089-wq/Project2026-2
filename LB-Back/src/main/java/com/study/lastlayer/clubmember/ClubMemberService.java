package com.study.lastlayer.clubmember;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.study.lastlayer.member.Member;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClubMemberService {

    private final ClubMemberRepository clubMemberRepository;

    public List<ClubMemberDto> getClubsByMember(Member member) {
        return clubMemberRepository.findByMemberId(member.getMember_id())
            .stream()
            .map(cm -> ClubMemberDto.builder()
                    .clubId(cm.getClub().getId())
                    .clubName(cm.getClub().getName())
                    .clubDescription(cm.getClub().getDescription())
                    .keywords(cm.getClub().getKeywords())
                    .managerName(cm.getClub().getMember().getName())
                    .bgFileId(cm.getClub().getFile() != null ? cm.getClub().getFile().getId() : null)
                    .filename(cm.getClub().getFile() != null ? cm.getClub().getFile().getFilename() : null)
                    .createdAt(cm.getClub().getCreatedAt())
                    .build())
            .collect(Collectors.toList());
    }

	
    //전체 클럽 멤버 리스트
    public List<ClubMemberSimpleDto> getAllClubMembers() {
        return clubMemberRepository.findAll()
                .stream()
                .map(cm -> ClubMemberSimpleDto.builder()
                        .id(cm.getId())
                        .clubId(cm.getClub().getId())
                        .memberId(cm.getMember().getMember_id())
                        .build())
                .toList();
    }
    
}