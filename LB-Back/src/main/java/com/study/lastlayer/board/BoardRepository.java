package com.study.lastlayer.board;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BoardRepository extends JpaRepository<Board, Long> {

    // 전체 게시글
    @Query("""
        SELECT new com.study.lastlayer.board.BoardDto(
            b.id,
            b.board_type,
            b.contents,
            b.createdAt,
            b.deletedAt,
            b.like_count,
            b.title,
            b.updatedAt,
            b.view_count,
            b.club.id,
            bf.id,
            bf.filename,
            m.id,
            m.name,
            pf.filename
        )
        FROM Board b
        JOIN b.member m
        LEFT JOIN b.file bf
        LEFT JOIN m.profileImage pf
        WHERE b.deletedAt IS NULL
        ORDER BY b.createdAt DESC
    """)
    List<BoardDto> findBoardListWithMember();


    // 클럽별 전체 게시글
    @Query("""
        SELECT new com.study.lastlayer.board.BoardDto(
            b.id,
            b.board_type,
            b.contents,
            b.createdAt,
            b.deletedAt,
            b.like_count,
            b.title,
            b.updatedAt,
            b.view_count,
            b.club.id,
            bf.id,
            bf.filename,
            m.id,
            m.name,
            pf.filename
        )
        FROM Board b
        JOIN b.member m
        LEFT JOIN b.file bf
        LEFT JOIN m.profileImage pf
        WHERE b.deletedAt IS NULL
          AND b.club.id = :clubId
        ORDER BY b.createdAt DESC
    """)
    List<BoardDto> findBoardListByClubId(@Param("clubId") Long clubId);


    // 클럽별 공지글 (board_type = 2)
    @Query("""
        SELECT new com.study.lastlayer.board.BoardDto(
            b.id,
            b.board_type,
            b.contents,
            b.createdAt,
            b.deletedAt,
            b.like_count,
            b.title,
            b.updatedAt,
            b.view_count,
            b.club.id,
            bf.id,
            bf.filename,
            m.id,
            m.name,
            pf.filename
        )
        FROM Board b
        JOIN b.member m
        LEFT JOIN b.file bf
        LEFT JOIN m.profileImage pf
        WHERE b.deletedAt IS NULL
          AND b.club.id = :clubId
          AND b.board_type = 2
        ORDER BY b.createdAt DESC
    """)
    List<BoardDto> findNoticeBoardsByClubId(@Param("clubId") Long clubId);


    // 클럽별 일반 게시글 (board_type = 1)
    @Query("""
        SELECT new com.study.lastlayer.board.BoardDto(
            b.id,
            b.board_type,
            b.contents,
            b.createdAt,
            b.deletedAt,
            b.like_count,
            b.title,
            b.updatedAt,
            b.view_count,
            b.club.id,
            bf.id,
            bf.filename,
            m.id,
            m.name,
            pf.filename
        )
        FROM Board b
        JOIN b.member m
        LEFT JOIN b.file bf
        LEFT JOIN m.profileImage pf
        WHERE b.deletedAt IS NULL
          AND b.club.id = :clubId
          AND b.board_type = 1
        ORDER BY b.createdAt DESC
    """)
    List<BoardDto> findNormalBoardsByClubId(@Param("clubId") Long clubId);


 // 게시글 단일 조회
    @Query("""
        SELECT new com.study.lastlayer.board.BoardDto(
            b.id,
            b.board_type,
            b.contents,
            b.createdAt,
            b.deletedAt,
            b.like_count,
            b.title,
            b.updatedAt,
            b.view_count,
            b.club.id,
            bf.id,
            bf.filename,
            m.id,
            m.name,
            pf.filename
        )
        FROM Board b
        JOIN b.member m
        LEFT JOIN b.file bf
        LEFT JOIN m.profileImage pf
        WHERE b.deletedAt IS NULL
          AND b.id = :boardId
    """)
    Optional<BoardDto> findBoardDetailById(@Param("boardId") Long boardId);

//회원별 게시글 조회
    @Query("""
    	    SELECT new com.study.lastlayer.board.BoardDto(
    	        b.id,
    	        b.board_type,
    	        b.contents,
    	        b.createdAt,
    	        b.deletedAt,
    	        b.like_count,
    	        b.title,
    	        b.updatedAt,
    	        b.view_count,
    	        b.club.id,
    	        bf.id,
    	        bf.filename,
    	        m.id,
    	        m.name,
    	        pf.filename
    	    )
    	    FROM Board b
    	    JOIN b.member m
    	    LEFT JOIN b.file bf
    	    LEFT JOIN m.profileImage pf
    	    WHERE b.deletedAt IS NULL
    	      AND m.member_id = :memberId
    	    ORDER BY b.createdAt DESC
    	""")
    	List<BoardDto> findBoardsByMemberId(@Param("memberId") Long memberId);

}