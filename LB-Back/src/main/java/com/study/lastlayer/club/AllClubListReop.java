package com.study.lastlayer.club;

import java.util.List;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


@Repository
public interface AllClubListReop extends JpaRepository<Club, Long>{

	
	
	// 전체 클럽 리스트
	@Query("""
		    select new com.study.lastlayer.club.ClubDto(
		        c.id,
		        c.description,
		        c.keywords,
		        c.name,
		        f.id,
		        f.filename,
		        c.member.id,
		        c.createdAt
		    )
		    from Club c
		    left join c.file f
		""")
		List<ClubDto> findByClubList();

	
	   // 최신순 전체 클럽 리스트
    @Query("""
        select new com.study.lastlayer.club.ClubDto(
            c.id,
            c.description,
            c.keywords,
            c.name,
            f.id,
            f.filename,
            c.member.id,
            c.createdAt
        )
        from Club c
        left join c.file f
        order by c.createdAt desc
    """)
    List<ClubDto> findByClubListOrderByCreatedAtDesc();


    // 게시글 많은 순 클럽 리스트
    @Query(
            value = """
                SELECT
                    c.id,
                    c.description,
                    c.keywords,
                    c.name,
                    f.id AS bgFileId,
                    f.filename,
                    c.manager_id AS managerId,
                    c.created_at AS createdAt,
                    COUNT(b.id) AS postCount
                FROM club c
                LEFT JOIN file f ON f.id = c.bg_file_id
                LEFT JOIN board b ON b.club_id = c.id AND b.deleted_at IS NULL
                GROUP BY c.id, c.description, c.keywords, c.name, f.id, f.filename, c.manager_id, c.created_at
                ORDER BY COUNT(b.id) DESC
            """,
            nativeQuery = true
        )
    List<Object[]> findByClubListOrderByBoardCountNative();


 // 회원 많은 순 클럽 리스트
    @Query(
        value = """
            SELECT
                c.id,
                c.description,
                c.keywords,
                c.name,
                f.id AS bgFileId,
                f.filename,
                c.manager_id AS managerId,
                c.created_at AS createdAt,
                COUNT(cm.id) AS memberCount
            FROM club c
            LEFT JOIN file f ON f.id = c.bg_file_id
            LEFT JOIN club_member cm ON cm.club_id = c.id
            GROUP BY c.id, c.description, c.keywords, c.name, f.id, f.filename, c.manager_id, c.created_at
            ORDER BY COUNT(cm.id) DESC
        """,
        nativeQuery = true
    )
    List<Object[]> findClubsOrderByMemberCount();

//검색
    @Query("""
    	    select new com.study.lastlayer.club.ClubDto(
    	        c.id,
    	        c.description,
    	        c.keywords,
    	        c.name,
    	        f.id,
    	        f.filename,
    	        c.member.id,
    	        c.createdAt
    	    )
    	    from Club c
    	    left join c.file f
    	    where c.name like concat('%', :keyword, '%')
    	       or c.keywords like concat('%', :keyword, '%')
    	""")
    	List<ClubDto> searchClubsByKeyword(@Param("keyword") String keyword);


    
    
    
}
	

