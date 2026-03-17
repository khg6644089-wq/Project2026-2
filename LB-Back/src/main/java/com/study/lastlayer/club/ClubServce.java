package com.study.lastlayer.club;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.study.lastlayer.file.File;
import com.study.lastlayer.file.FileRepository;
import com.study.lastlayer.fileupload.FileUploadService;
import com.study.lastlayer.member.Member;
import com.study.lastlayer.member.MemberRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClubServce {

	@Value("${file.upload-dir}")
	private String uploadDir;

	private final AllClubListReop allClubListReop;
	private final ClubRepository clubRepository;
    private final MemberRepository memberRepository;
    private final FileRepository fileRepository;
	
	 public List<ClubDto> getAllClubList(){
	        return allClubListReop.findByClubList();
	    }

	 public List<ClubDto> getAllClubListOrderByCreatedAtDesc() {
		 return allClubListReop.findByClubListOrderByCreatedAtDesc();
	 }

	 
//	 네이티브 쿼리 때문에 길어요 
//	 게시글 많은 순
	    public List<ClubDto> getAllClubListOrderByBoardCountNative() {
	        List<Object[]> results = allClubListReop.findByClubListOrderByBoardCountNative();
	        List<ClubDto> dtoList = new ArrayList<>();

	        for (Object[] row : results) {
	            ClubDto dto = ClubDto.builder()
	                .id(((Number) row[0]).longValue())
	                .description((String) row[1])
	                .keywords((String) row[2])
	                .name((String) row[3])
	                .bgFileId(row[4] != null ? ((Number) row[4]).longValue() : null)
	                .filename((String) row[5])
	                .managerId(((Number) row[6]).longValue())
	                .createdAt(((java.sql.Timestamp) row[7]).toLocalDateTime())
	                .build();

	            dtoList.add(dto);
	        }

	        return dtoList;
	    }

	    
	    
	    
	    
	 // 클럽별 회원 많은 순
	    public List<ClubDto> getAllClubsByMemberCount() {
	        List<Object[]> results = allClubListReop.findClubsOrderByMemberCount();
	        List<ClubDto> dtoList = new ArrayList<>();

	        for (Object[] row : results) {
	            ClubDto dto = ClubDto.builder()
	                    .id(((Number) row[0]).longValue())
	                    .description((String) row[1])
	                    .keywords((String) row[2])
	                    .name((String) row[3])
	                    .bgFileId(row[4] != null ? ((Number) row[4]).longValue() : null)
	                    .filename((String) row[5])
	                    .managerId(((Number) row[6]).longValue())
	                    .createdAt(((java.sql.Timestamp) row[7]).toLocalDateTime())
	                    .build();

	            dtoList.add(dto);
	        }

	        return dtoList;
	    }

	    
	    //클럽 검색
	    public List<ClubDto> searchClubs(String keyword) {
	        return allClubListReop.searchClubsByKeyword(keyword);
	    }

	
	    
	    
	    //클럽 생성
	    @Transactional
	    public Long createClub(ClubCreateDto dto, Long memberId) throws Exception {

	        // 멤버 조회
	        Member manager = memberRepository.findById(memberId)
	                .orElseThrow(() -> new RuntimeException("멤버가 존재하지 않습니다."));

	        // 파일 처리
	        File fileEntity = null;

	        if (dto.getFile() != null && !dto.getFile().isEmpty()) {

	            MultipartFile uploadedFile = dto.getFile();
				String ext = FileUploadService.getFileExtension(uploadedFile.getOriginalFilename());
				String storedFilename = UUID.randomUUID() + ext;

	            Path savePath = Paths.get(uploadDir, storedFilename);
	            Files.createDirectories(savePath.getParent());
				uploadedFile.transferTo(savePath.toAbsolutePath().toFile());

	            fileEntity = File.builder()
	                    .filename(storedFilename)
	                    .org_filename(uploadedFile.getOriginalFilename())
	                    .build();

	            fileRepository.save(fileEntity);
	        }

	        // 클럽 생성
	        Club club = Club.builder()
	                .name(dto.getName())
	                .description(dto.getDescription())
	                .keywords(dto.getKeywords())
	                .file(fileEntity)   
	                .member(manager)
	                .build();

	        clubRepository.save(club);

	        return club.getId();
	    }
	 
	 

}
