package com.system.cleancode.controller;

import com.system.cleancode.dto.SnippetRequest;
import com.system.cleancode.dto.SnippetResponse;
import com.system.cleancode.service.SnippetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/snippets")
@RequiredArgsConstructor
public class SnippetController {

    private final SnippetService snippetService;

    @PostMapping
    public ResponseEntity<SnippetResponse> createSnippet(@RequestBody SnippetRequest request, Principal principal) {
        return ResponseEntity.ok(snippetService.createSnippet(request, principal));
    }

    @GetMapping
    public ResponseEntity<List<SnippetResponse>> getUserSnippets(Principal principal) {
        return ResponseEntity.ok(snippetService.getUserSnippets(principal));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SnippetResponse> getSnippetById(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(snippetService.getSnippetById(id, principal));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SnippetResponse> updateSnippet(@PathVariable Long id, @RequestBody SnippetRequest request, Principal principal) {
        return ResponseEntity.ok(snippetService.updateSnippet(id, request, principal));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSnippet(@PathVariable Long id, Principal principal) {
        snippetService.deleteSnippet(id, principal);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<SnippetResponse>> searchSnippets(
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String keyword,
            Principal principal) {
        return ResponseEntity.ok(snippetService.searchSnippets(language, keyword, principal));
    }
}