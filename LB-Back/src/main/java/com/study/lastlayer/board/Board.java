package com.study.lastlayer.board;

import java.time.LocalDateTime;

import com.study.lastlayer.club.Club;
import com.study.lastlayer.file.File;
import com.study.lastlayer.member.Member;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "board")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Board {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "club_id", nullable = false)
	private Club club;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "member_id", nullable = false)
	private Member member;
	
	@Column(nullable = false)
	private String title;
	
	@Column(nullable = false)
	private String contents;
	
	@Builder.Default
	@Column(nullable = false)
	private Integer view_count = 0;
	
	
	@Builder.Default
	@Column(nullable = false)
	private Integer like_count = 0;
	
	
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="file_id")
	private File file;
	
	
	@Column(nullable = false)
	private Integer board_type;
	
	@Column(nullable = false)
	private LocalDateTime createdAt;

	@Column(nullable = false)
	private LocalDateTime updatedAt;
	
	@Column
	    private LocalDateTime deletedAt;
	
	
	@PrePersist
	public void onCreated() {
		this.createdAt = LocalDateTime.now();
		 this.updatedAt = LocalDateTime.now();
	}
	
	@PreUpdate
	public void onUpdate() {
	    this.updatedAt = LocalDateTime.now();
	}

	 public void softDelete() {
	        this.deletedAt = LocalDateTime.now();
	    }

	 public boolean isDeleted() {
	        return this.deletedAt != null;
	    }
	
}
