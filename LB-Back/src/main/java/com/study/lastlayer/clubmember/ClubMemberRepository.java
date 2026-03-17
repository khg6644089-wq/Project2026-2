package com.study.lastlayer.clubmember;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ClubMemberRepository extends JpaRepository<ClubMember, Long> {

    @Query("SELECT cm FROM ClubMember cm WHERE cm.member.member_id = :memberId")
    List<ClubMember> findByMemberId(@Param("memberId") Long memberId);

 // 🔥 승인 시 중복 체크 (안전한 JPQL 방식)
    @Query("""
           SELECT COUNT(cm) > 0
           FROM ClubMember cm
           WHERE cm.club.id = :clubId
           AND cm.member.member_id = :memberId
           """)
    boolean existsClubMember(
            @Param("clubId") Long clubId,
            @Param("memberId") Long memberId
    );
}