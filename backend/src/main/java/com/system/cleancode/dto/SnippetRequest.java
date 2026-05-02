package com.system.cleancode.dto;

import lombok.*;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SnippetRequest {
    private String title;
    private String content;
    private String language;
    private Set<String> tags;
}
