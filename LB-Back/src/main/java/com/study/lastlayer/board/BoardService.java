package com.study.lastlayer.board;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.study.lastlayer.club.Club;
import com.study.lastlayer.club.ClubRepository;
import com.study.lastlayer.file.File;
import com.study.lastlayer.file.FileRepository;
import com.study.lastlayer.fileupload.FileUploadService;
import com.study.lastlayer.member.Member;
import com.study.lastlayer.member.MemberRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BoardService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    private final BoardRepository boardRepository;
    private final ClubRepository clubRepository;
    private final MemberRepository memberRepository;
    private final FileRepository fileRepository;
    

    //전체
    public List<BoardDto> getBoardList() {
        return boardRepository.findBoardListWithMember();
    }

    
    //클럽별 게시글
    public List<BoardDto> getBoardListByClubId(Long clubId) {
        return boardRepository.findBoardListByClubId(clubId);
    }

//클럽별 공지사항
    public List<BoardDto> getNoticeBoardListByClubId(Long clubId) {
        return boardRepository.findNoticeBoardsByClubId(clubId);
    }

 // 클럽별 일반 게시글 조회
    public List<BoardDto> getNormalBoardListByClubId(Long clubId) {
        return boardRepository.findNormalBoardsByClubId(clubId);
    }

 // 게시글 단일 조회
    public BoardDto getBoardDetail(Long boardId) {
        return boardRepository.findBoardDetailById(boardId)
                .orElseThrow(() -> new RuntimeException("게시글이 존재하지 않습니다."));
    }


    //작성
    @Transactional
    public BoardDto createBoard(BoardCreateDto dto, Member member) throws Exception { // throws Exception 추가
        // 클럽 확인
        Club club = clubRepository.findById(dto.getClubId())
                .orElseThrow(() -> new RuntimeException("클럽이 존재하지 않습니다."));

        // 파일 처리
        File fileEntity = null;
        if (dto.getFile() != null && !dto.getFile().isEmpty()) {
            MultipartFile uploadedFile = dto.getFile();
            String storedFilename = UUID.randomUUID() + "_" + uploadedFile.getOriginalFilename();

            // 실제 서버 폴더에 저장 (application-prod: /app/upload → 볼륨 /home/upload)
            Path savePath = Paths.get(uploadDir, storedFilename);
            Files.createDirectories(savePath.getParent());
            uploadedFile.transferTo(savePath.toFile());

            // DB에 파일 정보 저장
            fileEntity = File.builder()
                    .filename(storedFilename)
                    .org_filename(uploadedFile.getOriginalFilename())
                    .build();
            fileRepository.save(fileEntity);
        }

        // 게시글 생성
        Board board = Board.builder()
                .club(club)
                .member(member)
                .title(dto.getTitle())
                .contents(dto.getContents())
                .board_type(dto.getBoardType())
                .file(fileEntity)
                .build();

        boardRepository.save(board);

        // DTO 반환
        return new BoardDto(
                board.getId(),
                board.getBoard_type(),
                board.getContents(),
                board.getCreatedAt(),
                board.getDeletedAt(),
                board.getLike_count(),
                board.getTitle(),
                board.getUpdatedAt(),
                board.getView_count(),
                club.getId(),
                fileEntity != null ? fileEntity.getId() : null,      // file_id 반환
                fileEntity != null ? fileEntity.getFilename() : null, // filename 반환
                member.getMember_id(),
                dto.getMemberName() != null ? dto.getMemberName() : member.getName(),
                member.getProfileImage() != null ? member.getProfileImage().getFilename() : null
        );
    }


	
//수정
    @Transactional
    public BoardDto updateBoard(Long boardId, BoardUpdateDto dto, Member member) throws Exception {

        // 게시글 조회
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("게시글이 존재하지 않습니다."));

        // 삭제 여부 확인
        if (board.getDeletedAt() != null) {
            throw new RuntimeException("삭제된 게시글입니다.");
        }

        // 작성자 검증
        if (!board.getMember().getMember_id().equals(member.getMember_id())) {
            throw new RuntimeException("수정 권한이 없습니다.");
        }

        // ===== 기본 필드 수정 =====
        board.setTitle(dto.getTitle());
        board.setContents(dto.getContents());
        board.setBoard_type(dto.getBoardType());

        // ===== 파일 처리 (새 파일이 들어온 경우 교체) =====
        if (dto.getFile() != null && !dto.getFile().isEmpty()) {

            MultipartFile uploadedFile = dto.getFile();
			String ext = FileUploadService.getFileExtension(uploadedFile.getOriginalFilename());
			String storedFilename = UUID.randomUUID() + ext;

            Path savePath = Paths.get(uploadDir, storedFilename);
            Files.createDirectories(savePath.getParent());
			uploadedFile.transferTo(savePath.toAbsolutePath().toFile());

            File fileEntity = File.builder()
                    .filename(storedFilename)
                    .org_filename(uploadedFile.getOriginalFilename())
                    .build();

            fileRepository.save(fileEntity);

            board.setFile(fileEntity);
        }

        // save는 @Transactional + Dirty Checking으로 자동 반영되지만
        // 명확히 해주고 싶으면 아래 줄 유지해도 됨
        boardRepository.save(board);

        // ===== DTO 반환 (createBoard와 동일한 구조) =====
        return new BoardDto(
                board.getId(),
                board.getBoard_type(),
                board.getContents(),
                board.getCreatedAt(),
                board.getDeletedAt(),
                board.getLike_count(),
                board.getTitle(),
                board.getUpdatedAt(),
                board.getView_count(),
                board.getClub().getId(),
                board.getFile() != null ? board.getFile().getId() : null,
                board.getFile() != null ? board.getFile().getFilename() : null,
                board.getMember().getMember_id(),
                board.getMember().getName(),
                board.getMember().getProfileImage() != null
                        ? board.getMember().getProfileImage().getFilename()
                        : null
        );
    }


	//삭제
    @Transactional
    public void deleteBoard(Long boardId) {

        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("게시글이 존재하지 않습니다."));

        if (board.getDeletedAt() != null) {
            throw new RuntimeException("이미 삭제된 게시글입니다.");
        }

        board.softDelete(); // deletedAt = now()
    }

 // 로그인 회원 기준 게시글 조회
    public List<BoardDto> getMyBoards(Long memberId) {
        return boardRepository.findBoardsByMemberId(memberId);
    }
    
  
 
    @Transactional
    public BoardDto incrementViewCountAndGetDetail(Long boardId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("게시글이 존재하지 않습니다."));

        // 삭제된 게시글이면 조회수 증가 불가
        if (board.isDeleted()) {
            throw new RuntimeException("삭제된 게시글입니다.");
        }

        // 조회수 증가
        board.setView_count(board.getView_count() + 1);
        boardRepository.save(board); // @Transactional + Dirty Checking으로 자동 반영 가능

        // DTO 반환
        return new BoardDto(
                board.getId(),
                board.getBoard_type(),
                board.getContents(),
                board.getCreatedAt(),
                board.getDeletedAt(),
                board.getLike_count(),
                board.getTitle(),
                board.getUpdatedAt(),
                board.getView_count(),
                board.getClub().getId(),
                board.getFile() != null ? board.getFile().getId() : null,
                board.getFile() != null ? board.getFile().getFilename() : null,
                board.getMember().getMember_id(),
                board.getMember().getName(),
                board.getMember().getProfileImage() != null
                        ? board.getMember().getProfileImage().getFilename()
                        : null
        );
    }
	


}