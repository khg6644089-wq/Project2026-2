package com.study.lastlayer.club;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.study.lastlayer.auth.CustomUserPrincipal;
import com.study.lastlayer.clubmember.ClubMemberService;
import com.study.lastlayer.member.Member;
import com.study.lastlayer.member.MemberService;
import com.study.lastlayer.member.MemberService;
import org.springframework.http.ResponseEntity;
import com.study.lastlayer.member.MemberService;

import io.swagger.v3.oas.annotations.parameters.RequestBody;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/clubs")

public class ClubController {
	
	 
	
	@Autowired
	private MemberService memberService;
	
	@Autowired
	private final ClubServce clubServce;
	
	
	//전체 클럽 리스트
	 @GetMapping("")
	public List<ClubDto> getClubList(){
		return clubServce.getAllClubList();
	}
	 
	
	// 최신순 클럽 리스트
	 @GetMapping("/latest")
	 public List<ClubDto> getLatestClubList(){
	     return clubServce.getAllClubListOrderByCreatedAtDesc();
	 }
	 
	 
	// 게시글 많은 순 클럽 리스트
	 @GetMapping("/mostBoards")
	 public List<ClubDto> getClubListByBoardCount() {
		 return clubServce.getAllClubListOrderByBoardCountNative();
	 }
	 
	
	// 회원 많은 순 클럽 리스트
	 @GetMapping("/mostMember")
	    public List<ClubDto> getClubListByMemberCount() {
	        return clubServce.getAllClubsByMemberCount();
	    }
	 
	 //클럽 검색
	 @GetMapping("/search")
	 public List<ClubDto> searchClubs(@RequestParam("keyword") String keyword) {
	     return clubServce.searchClubs(keyword);
	 }
	 
	 
	// 클럽 생성
	 @PostMapping
	    @PreAuthorize("isAuthenticated()")
	    public ResponseEntity<Long> createClub(
	            @AuthenticationPrincipal CustomUserPrincipal principal,
	            @ModelAttribute ClubCreateDto dto
	    ) throws Exception {

	        Member member = memberService.getMember(principal.getMemberId());
	        Long clubId = clubServce.createClub(dto, member.getMember_id());

	        return ResponseEntity.ok(clubId);
	    }
	 
	 

}
