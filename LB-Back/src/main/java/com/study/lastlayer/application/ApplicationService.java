package com.study.lastlayer.application;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.study.lastlayer.club.Club;
import com.study.lastlayer.club.ClubRepository;
import com.study.lastlayer.clubmember.ClubMember;
import com.study.lastlayer.clubmember.ClubMemberRepository;
import com.study.lastlayer.member.Member;
import com.study.lastlayer.member.MemberService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ClubRepository clubRepository;
    private final MemberService memberService;
   
    private final ClubMemberRepository clubMemberRepository;

    
    //가입 신청
    @Transactional
    public ApplicationResponseDto apply(Long loginMemberId, ApplicationCreateDto dto) {

        
        Member member = memberService.getMember(loginMemberId);

        
        Club club = clubRepository.findById(dto.getClubId())
                .orElseThrow(() -> new IllegalArgumentException("클럽이 존재하지 않습니다."));

        
        Application existing =
                applicationRepository.findByMemberAndClub(member, club).orElse(null);

        Application application;

        if (existing == null) {

            application = Application.builder()
                    .member(member)
                    .club(club)
                    .status(ApplicationStatus.PENDING)
                    .completedAt(null)
                    .build();

        } else {

            switch (existing.getStatus()) {

                case PENDING:
                    throw new IllegalStateException("이미 가입 승인을 대기 중입니다.");

                case APPROVED:
                    throw new IllegalStateException("이미 해당 클럽의 멤버입니다.");

                case REJECTED:
                    existing.setStatus(ApplicationStatus.PENDING);
                    existing.setCompletedAt(null);
                    application = existing;
                    break;

                default:
                    throw new IllegalStateException("알 수 없는 상태입니다.");
            }
        }

        applicationRepository.save(application);

        return ApplicationResponseDto.builder()
                .applicationId(application.getId())
                .memberId(member.getMember_id())
                .memberName(member.getName())
                .clubId(club.getId())
                .clubName(club.getName())
                .status(application.getStatus())
                .build();
    }

    
    //가입신청 리스트
    @Transactional(readOnly = true)
    public List<ApplicationListDto> getPendingApplications(Long loginMemberId, Long clubId) {

        // 1. 클럽 조회
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new IllegalArgumentException("클럽이 존재하지 않습니다."));

        // 2. 매니저 권한 체크
        if (!club.getMember().getMember_id().equals(loginMemberId)) {
            throw new IllegalStateException("해당 클럽의 매니저만 조회할 수 있습니다.");
        }

        // 3. PENDING 상태 신청 목록 조회
        List<Application> applications =
                applicationRepository.findByClubAndStatus(club, ApplicationStatus.PENDING);

        // 4. DTO 변환
        return applications.stream()
                .map(app -> ApplicationListDto.builder()
                        .applicationId(app.getId())
                        .memberId(app.getMember().getMember_id())
                        .memberName(app.getMember().getName())
                        .status(app.getStatus())
                        .build())
                .toList();
    }


    //승인
    @Transactional
    public void approve(Long applicationId) {

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("신청이 존재하지 않습니다."));

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new IllegalStateException("이미 처리된 신청입니다.");
        }

        Club club = application.getClub();
        Member member = application.getMember();

        boolean alreadyMember =
                clubMemberRepository.existsClubMember(
                        club.getId(),
                        member.getMember_id()
                );

        if (alreadyMember) {
            throw new IllegalStateException("이미 가입된 멤버입니다.");
        }

        application.setStatus(ApplicationStatus.APPROVED);
        application.setCompletedAt(LocalDateTime.now());

        ClubMember clubMember = ClubMember.builder()
                .club(club)
                .member(member)
                .build();

        clubMemberRepository.save(clubMember);
    }

    
    
    
    //거절
    @Transactional
    public void reject(Long applicationId) {

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("신청이 존재하지 않습니다."));

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new IllegalStateException("이미 처리된 신청입니다.");
        }

        application.setStatus(ApplicationStatus.REJECTED);
        application.setCompletedAt(LocalDateTime.now());
    }


    //로그인한 유저의 현재 가입 신청 상태 조회
    public String getMyStatus(Long clubId, Long memberId) {

        return applicationRepository
                .findByClubAndMember(clubId, memberId)
                .map(a -> a.getStatus().name())
                .orElse("NONE");
    }
    
   
    
    
    
}