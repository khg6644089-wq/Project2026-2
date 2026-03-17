package com.study.lastlayer.club;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.study.lastlayer.board.Board;
import com.study.lastlayer.clubmember.ClubMember;

public interface ClubRepository extends JpaRepository<Club, Long> {

	//전체
    @Query("""
        SELECT new com.study.lastlayer.club.ClubSummaryDto(
            c.id,
            c.name,
            c.description,
            c.keywords,
            f.id,
            f.filename,
            m.member_id,
            m.name,
            c.createdAt,
            COUNT(DISTINCT cm.id),
            COUNT(DISTINCT b.id)
        )
        FROM Club c
        JOIN c.member m
        LEFT JOIN c.file f
        LEFT JOIN ClubMember cm ON cm.club.id = c.id
        LEFT JOIN Board b ON b.club.id = c.id AND b.deletedAt IS NULL
        GROUP BY c.id, c.name, c.description, c.keywords,
                 f.id, f.filename,
                 m.member_id, m.name, c.createdAt
    """)
    List<ClubSummaryDto> findClubSummaryList();

 // 단일 조회
    @Query("""
        SELECT new com.study.lastlayer.club.ClubSummaryDto(
            c.id,
            c.name,
            c.description,
            c.keywords,
            f.id,
            f.filename,
            m.member_id,
            m.name,
            c.createdAt,
            COUNT(DISTINCT cm.id),
            COUNT(DISTINCT b.id)
        )
        FROM Club c
        JOIN c.member m
        LEFT JOIN c.file f
        LEFT JOIN ClubMember cm ON cm.club.id = c.id
        LEFT JOIN Board b ON b.club.id = c.id AND b.deletedAt IS NULL
        WHERE c.id = :id
        GROUP BY c.id, c.name, c.description, c.keywords,
                 f.id, f.filename,
                 m.member_id, m.name, c.createdAt
    """)
    ClubSummaryDto findClubSummaryById(@Param("id") Long id);
}