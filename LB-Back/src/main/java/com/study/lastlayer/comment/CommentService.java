package com.study.lastlayer.comment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.study.lastlayer.board.Board;
import com.study.lastlayer.board.BoardRepository;
import com.study.lastlayer.member.Member;
import com.study.lastlayer.member.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;
    private final BoardRepository boardRepository;
    private final MemberRepository memberRepository;

    // 댓글 조회
    public Page<CommentResponseDto> getCommentsByBoard(Long boardId, Pageable pageable) {

        return commentRepository.findByBoardId(boardId, pageable)
                .map(comment -> new CommentResponseDto(
                        comment.getId(),
                        comment.getMember().getMember_id(),
                        comment.getMember().getName(),
                        comment.getMember().getProfileImage() != null
                            ? comment.getMember().getProfileImage().getFilename()
                            : null,
                        comment.getContent(),
                        comment.getCreatedAt()
                ));
    }

    // 댓글 작성
    @Transactional
    public CommentResponseDto createComment(Long boardId, Long memberId, CommentCreateDto dto) {

        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

        Comment comment = Comment.builder()
                .board(board)
                .member(member)
                .content(dto.getContent())
                .build();

        Comment saved = commentRepository.save(comment);

        return new CommentResponseDto(
                saved.getId(),
                member.getMember_id(),
                member.getName(),
                member.getProfileImage() != null
                    ? member.getProfileImage().getFilename()
                    : null,
                saved.getContent(),
                saved.getCreatedAt()
        );
    }
}