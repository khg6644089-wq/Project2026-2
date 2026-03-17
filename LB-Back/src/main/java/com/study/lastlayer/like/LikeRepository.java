package com.study.lastlayer.like;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.study.lastlayer.board.Board;
import com.study.lastlayer.member.Member;

public interface LikeRepository extends JpaRepository<Like, Long> {

    Optional<Like> findByBoardAndMember(Board board, Member member);

    Long countByBoard(Board board);
}