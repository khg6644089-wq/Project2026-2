package com.study.lastlayer.fileupload;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.study.lastlayer.file.File;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Encoding;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody; // 명확한 RequestBody 정의를 위해 사용
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "파일 업로드 API", description = "파일 업로드")
@RestController
public class FileUploadController {
	@Autowired
	FileUploadService fileService;

	@Value("${file.upload-dir}")
	String fileDir;

	@Operation(summary = "다중 파일 업로드", description = "하나 이상의 파일을 서버에 업로드하고, 저장된 파일 정보를 반환합니다. 폼 데이터(multipart/form-data)를 사용함."
			+ "<br>파일저장폴더:application.properties의 file.upload-dir (초기값:c:/travly/upload)",
			// 1. 파일 업로드는 폼 데이터(multipart/form-data)를 사용함을 명시합니다.
			requestBody = @RequestBody(content = @Content(
					// mediaType을 multipart/form-data로 설정
					mediaType = "multipart/form-data",
					// schema를 FileUploadDto로 지정하여 어떤 필드를 받는지 명시
					schema = @Schema(implementation = FileUploadDto.class),
					// 파일 리스트 필드에 대한 인코딩 정보를 추가 (선택적)
					encoding = @Encoding(name = "files", contentType = "application/octet-stream"))))
	@ApiResponse(responseCode = "200", description = "파일 업로드 및 저장 성공, 저장된 파일 정보 리스트 반환",
			// 2. 응답 모델이 List<File> 임을 명시
			content = @Content(
					// 배열 타입 응답 명시
					schema = @Schema(implementation = File.class, type = "array")))

	@PostMapping("file")
	public List<File> fileUpload(@ModelAttribute FileUploadDto req) throws IOException {

		List<File> lst = fileService.fileCreate(req);
		return lst;
	}

	// 1. 확장자와 MediaType 값을 매핑하는 Map을 static final로 정의
	//	private static final Map<String, String> EXTENSION_TO_MEDIA_TYPE = Map.of(".jpg", MediaType.IMAGE_JPEG_VALUE,
	//			".jpeg", MediaType.IMAGE_JPEG_VALUE, ".png", MediaType.IMAGE_PNG_VALUE, ".gif", MediaType.IMAGE_GIF_VALUE,
	//			".webp", "image/webp", ".bmp", "image/bmp"
	//	// 다른 타입이 필요하면 여기에 추가합니다.
	//	);
	//
	//	public String getContentType(String filename) {
	//		// 1. 파일명에서 확장자를 추출합니다. (이전에 논의된 getFileExtension 메서드 사용)
	//		String extension = FileUploadService.getFileExtension(filename).toLowerCase();
	//
	//		// 2. Map에서 확장자에 해당하는 ContentType을 조회하고, 없으면 null을 반환합니다.
	//		return EXTENSION_TO_MEDIA_TYPE.get(extension);
	//	}

	private ResponseEntity<Resource> downloadByFilename(String filename) {
		try {
			// 1. 파일 경로 생성
			Path filePath = Paths.get(fileDir).resolve(filename).normalize();
			Resource resource = new UrlResource(filePath.toUri());

			// 2. 파일 존재 여부 및 접근성 확인
			if (resource.exists() && resource.isReadable()) {

				// 3. 파일 MIME 타입 결정 (Content-Type 헤더 설정)
				String contentType = "application/octet-stream"; // 기본값
				try {
					// 실제 파일 타입 결정 로직 (예: .jpg는 image/jpeg)
					// (실제 프로젝트에서는 Files.probeContentType(filePath) 등을 사용 권장)
					contentType = Files.probeContentType(filePath);

				} catch (Exception ex) {
					// 파일 타입 결정 실패 시 무시

				}

				// 4. ResponseEntity 구성 및 반환
				return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType))
						// Content-Disposition을 'inline'으로 설정하면 브라우저에 표시됩니다.
						.header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
						.body(resource);

			} else {
				// 파일이 존재하지 않거나 읽을 수 없는 경우
				return ResponseEntity.notFound().build();
			}
		} catch (MalformedURLException ex) {
			// 잘못된 URL 구조 예외 처리
			return ResponseEntity.badRequest().build();
		}
	}

	@GetMapping("file/{filename}")
	public ResponseEntity<Resource> downloadFile(@PathVariable("filename") String filename) {
		return downloadByFilename(filename);

	}

	@GetMapping("file/id/{fileId}")
	public ResponseEntity<Resource> downloadFileById(@PathVariable("fileId") Long fileId) {
		File file = fileService.findById(fileId);

		return downloadByFilename(file.getFilename());
	}
}
