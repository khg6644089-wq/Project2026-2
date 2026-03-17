package com.study.lastlayer.fileupload;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.study.lastlayer.exception.BadRequestException;
import com.study.lastlayer.file.File;
import com.study.lastlayer.file.FileRepository;

import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;

@Service
@Slf4j
public class FileUploadService {
	@Value("${file.upload-dir}")
	String fileDir;

	@Autowired
	FileRepository fileRepo;

	public List<File> fileCreate(FileUploadDto dto) throws IOException {
		return fileCreate(dto, 200, 200);
	}

	public List<File> fileCreate(FileUploadDto dto, int thumbSize) throws IOException {
		return fileCreate(dto, thumbSize, thumbSize);
	}

	public static String getFileExtension(String filename) {
		// 1. 마지막 점(.)의 인덱스를 찾습니다.
		int lastDotIndex = filename.lastIndexOf('.');

		// 2. 점이 파일명에 없거나, 점이 맨 앞에만 있는 경우 (숨김 파일 등)
		if (lastDotIndex == -1 || lastDotIndex == 0) {
			return ""; // 확장자가 없거나 유효하지 않음
		}

		// 3. 점을 포한한 문자열(확장자)을 반환합니다.
		return filename.substring(lastDotIndex);
	}

	/**
	 * 단일 파일 생성 (핵심 로직 분리)
	 */
	public File fileCreateOne(MultipartFile file, int thumbX, int thumbY) throws IOException {
		if (file == null || file.isEmpty()) {
			return null;
		}

		String originalFilename = file.getOriginalFilename();
		String ext = getFileExtension(originalFilename);

		// 고유한 파일명 생성
		String newName = UUID.randomUUID() + ext;
		log.info("----fileCreateOne() getOriginalFilename() : " + originalFilename);

		java.io.File folder = new java.io.File(fileDir);
		if (!folder.exists()) {
			folder.mkdirs();
		}

		// 원본 파일 저장
		byte[] fileData = file.getBytes();
		Files.write(Paths.get(fileDir, newName), fileData);

		// 이미지인 경우 썸네일 생성
		if (isImage(originalFilename)) {
			Thumbnails.of(new ByteArrayInputStream(fileData))
					.size(thumbX, thumbY)
					.outputFormat("jpg")
					.toFile(fileDir + "/t_" + newName + ".jpg"); // 썸네일 파일 저장
		}

		// DB 저장
		File fileEntity = File.builder()
				.filename(newName)
				.org_filename(originalFilename)
				.build();

		return fileRepo.save(fileEntity);
	}

	/**
	 * 다중 파일 생성 (fileCreateOne을 호출하도록 변경)
	 */
	public List<File> fileCreate(FileUploadDto dto, int thumbX, int thumbY) throws IOException {
		List<File> lst = new ArrayList<>();
		List<MultipartFile> files = dto.getFiles();

		if (files != null) {
			for (MultipartFile file : files) {
				// 단일 파일 처리 메서드 호출
				File savedFile = fileCreateOne(file, thumbX, thumbY);
				if (savedFile != null) {
					lst.add(savedFile);
				}
			}
		}
		return lst;
	}

	public File findById(Long fileId) {
		File file = fileRepo.findById(fileId)
				.orElseThrow(() -> new BadRequestException(String.format("존재하지 않는 file.id [%d]", fileId)));
		return file;
	}

	public static boolean isImage(String fileName) {
		String name = fileName.toLowerCase();
		return name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png") || name.endsWith(".gif")
				|| name.endsWith(".bmp") || name.endsWith(".webp");
	}

	@Transactional
	public void deletePhysicalFile(String filename) {
		try {
			// Paths.get을 사용하여 OS 독립적으로 경로 생성
			java.io.File file = Paths.get(fileDir, filename).toFile();
			if (file.exists())
				file.delete();

			// 썸네일 파일명 생성 시에도 동일하게 적용
			String thumbName = "t_" + filename + ".jpg";
			java.io.File thumbFile = Paths.get(fileDir, thumbName).toFile();
			if (thumbFile.exists())
				thumbFile.delete();
		} catch (Exception e) {
			log.info("파일 삭제 실패: " + e.getMessage());
		}
	}
}
