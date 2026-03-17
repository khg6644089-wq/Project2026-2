package com.study.lastlayer.weekhistory;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.study.lastlayer.auth.CustomUserPrincipal;
import com.study.lastlayer.authuser.AuthUser;
import com.study.lastlayer.weekhistory.WeekHistoryDto.*;

@RestController
@RequestMapping("/api/weight")
public class WeekHistoryController {

    private final WeekHistoryService service;

    public WeekHistoryController(WeekHistoryService service) {
        this.service = service;
    }

    @PostMapping("/week-history")
    public WeekHistoryResponse addWeekHistory(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestBody WeekHistoryRequest request) {

    	Long memberId = principal.getMemberId();
        return service.addWeekHistory(memberId, request);
    }

    @PutMapping("/week-history/{id}")
    public WeekHistoryResponse updateWeekHistory(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable("id") Long id,
            @RequestBody WeekHistoryUpdateRequest request) {

        Long memberId = principal.getMemberId();
        return service.updateWeekHistory(memberId, id, request);
    }
    
    @DeleteMapping("/week-history/{id}")
    public String deleteWeekHistory(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable("id") Long id) {

        Long memberId = principal.getMemberId();
        return service.deleteWeekHistory(memberId, id);
    }

    @GetMapping("/week-history/paged")
    public List<WeekHistoryListResponse> getWeekHistory(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(name = "sort", defaultValue = "latest") String sort,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "4") int size) {

        Long memberId = principal.getMemberId();
        return service.getWeekHistory(memberId, sort, page, size);
    }

    @GetMapping("/week-history/all")
    public List<WeekHistoryListResponse> getAllWeekHistory(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(name = "sort", defaultValue = "latest") String sort,
            @RequestParam(name = "startDate", required = false) String startDate,
            @RequestParam(name = "endDate", required = false) String endDate) {

        Long memberId = principal.getMemberId();
        return service.getAllWeekHistory(memberId, sort, startDate, endDate);
    }
}