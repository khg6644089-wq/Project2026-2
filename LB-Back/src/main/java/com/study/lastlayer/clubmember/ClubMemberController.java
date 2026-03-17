package com.study.lastlayer.clubmember;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.study.lastlayer.member.Member;
import com.study.lastlayer.member.MemberService;
import com.study.lastlayer.auth.CustomUserPrincipal;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/myclubs")
@RequiredArgsConstructor
public class ClubMemberController {

    private final ClubMemberService clubMemberService;
    private final MemberService memberService;

    @GetMapping("")
    public ResponseEntity<List<ClubMemberDto>> getMyClubs(@AuthenticationPrincipal CustomUserPrincipal principal) {
        Member member = memberService.getMember(principal.getMemberId());
        List<ClubMemberDto> myClubs = clubMemberService.getClubsByMember(member);
        return ResponseEntity.ok(myClubs);
    }
    
    //전체 클럽 멤버 리스트
    @GetMapping("/all")
    public ResponseEntity<List<ClubMemberSimpleDto>> getAllClubMembers() {
        return ResponseEntity.ok(clubMemberService.getAllClubMembers());
    }
    
}