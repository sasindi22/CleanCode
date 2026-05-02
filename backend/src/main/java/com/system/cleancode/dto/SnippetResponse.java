package com.system.cleancode.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class SnippetResponse {
    private Long id;
    private String title;
    private String content;
    private String language;
    private LocalDateTime createdAt;
    private Set<String> tags;
}
