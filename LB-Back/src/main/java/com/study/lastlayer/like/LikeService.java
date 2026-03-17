package com.study.lastlayer.like;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.study.lastlayer.board.Board;
import com.study.lastlayer.board.BoardRepository;
import com.study.lastlayer.member.Member;
import com.study.lastlayer.member.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class LikeService {

    private final LikeRepository likeRepository;
    private final BoardRepository boardRepository;
    private final MemberRepository memberRepository;

    // 좋아요 누르기
    @Transactional
    public LikeDto likeBoard(Long boardId, Long memberId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

        boolean alreadyLiked = likeRepository.findByBoardAndMember(board, member).isPresent();
        if (alreadyLiked) {
            return LikeDto.builder()
                    .boardId(boardId)
                    .memberId(memberId)
                    .liked(false)
                    .build();
        }

        Like like = Like.builder()
                .board(board)
                .member(member)
                .build();
        likeRepository.save(like);

        board.setLike_count(likeRepository.countByBoard(board).intValue());

        return LikeDto.builder()
                .boardId(boardId)
                .memberId(memberId)
                .liked(true)
                .build();
    }

    // 좋아요 취소
    @Transactional
    public LikeDto unlikeBoard(Long boardId, Long memberId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

        Like like = likeRepository.findByBoardAndMember(board, member)
                .orElseThrow(() -> new IllegalArgumentException("좋아요가 존재하지 않습니다."));

        likeRepository.delete(like);

        board.setLike_count(likeRepository.countByBoard(board).intValue());

        return LikeDto.builder()
                .boardId(boardId)
                .memberId(memberId)
                .liked(false)
                .build();
    }

    // 총 좋아요 수 조회
    @Transactional(readOnly = true)
    public Long getLikeCount(Long boardId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));
        return likeRepository.countByBoard(board);
    }

    
    //단일조회
    @Transactional(readOnly = true)
    public LikeDto getLikeStatus(Long boardId, Long memberId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

        boolean liked = likeRepository.findByBoardAndMember(board, member).isPresent();

        return LikeDto.builder()
                .boardId(boardId)
                .memberId(memberId)
                .liked(liked)
                .build();
    }
}