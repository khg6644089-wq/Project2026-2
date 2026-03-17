package com.study.lastlayer.application;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.study.lastlayer.club.Club;
import com.study.lastlayer.member.Member;


public interface ApplicationRepository extends JpaRepository<Application, Long> {

	//신청
    Optional<Application> findByMemberAndClub(Member member, Club club);

    
    //가입신청 리스트 조회
	List<Application> findByClubAndStatus(Club club, ApplicationStatus pending);

	//로그인한 유저의 현재 가입 신청 상태 조회
	@Query("SELECT a FROM Application a " +
	           "WHERE a.club.id = :clubId " +
	           "AND a.member.member_id = :memberId")
	    Optional<Application> findByClubAndMember(
	            @Param("clubId") Long clubId,
	            @Param("memberId") Long memberId
	    );
	
	

}


