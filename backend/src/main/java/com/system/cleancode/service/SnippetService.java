package com.system.cleancode.service;

import com.system.cleancode.dto.SnippetRequest;
import com.system.cleancode.dto.SnippetResponse;
import com.system.cleancode.entity.Snippet;
import com.system.cleancode.entity.Tag;
import com.system.cleancode.entity.User;
import com.system.cleancode.repository.SnippetRepository;
import com.system.cleancode.repository.TagRepository;
import com.system.cleancode.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SnippetService {

    private final SnippetRepository snippetRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;

    @Transactional
    public SnippetResponse createSnippet(SnippetRequest request, Principal principal) {
        User user = getUserFromPrincipal(principal);

        Set<Tag> resolvedTags = request.getTags().stream()
                .map(tagName -> tagRepository.findByName(tagName)
                        .orElseGet(() -> tagRepository.save(new Tag(null, tagName))))
                .collect(Collectors.toSet());

        Snippet snippet = Snippet.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .language(request.getLanguage())
                .user(user)
                .tags(resolvedTags)
                .build();

        Snippet saved = snippetRepository.save(snippet);
        return mapToResponse(saved);
    }

    public List<SnippetResponse> getUserSnippets(Principal principal) {
        User user = getUserFromPrincipal(principal);
        return snippetRepository.findByUserId(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public SnippetResponse getSnippetById(Long id, Principal principal) {
        User user = getUserFromPrincipal(principal);
        Snippet snippet = snippetRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Snippet not found"));

        if (!snippet.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access Denied");
        }
        return mapToResponse(snippet);
    }

    @Transactional
    public SnippetResponse updateSnippet(Long id, SnippetRequest request, Principal principal) {
        User user = getUserFromPrincipal(principal);
        Snippet snippet = snippetRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Snippet not found"));

        if (!snippet.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access Denied");
        }

        snippet.setTitle(request.getTitle());
        snippet.setContent(request.getContent());
        snippet.setLanguage(request.getLanguage());

        Set<Tag> updatedTags = request.getTags().stream()
                .map(tagName -> tagRepository.findByName(tagName)
                        .orElseGet(() -> tagRepository.save(new Tag(null, tagName))))
                .collect(Collectors.toSet());

        snippet.setTags(updatedTags);

        Snippet updated = snippetRepository.save(snippet);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteSnippet(Long id, Principal principal) {
        User user = getUserFromPrincipal(principal);
        Snippet snippet = snippetRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Snippet not found"));

        if (!snippet.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access Denied");
        }
        snippetRepository.delete(snippet);
    }

    public List<SnippetResponse> searchSnippets(String language, String keyword, Principal principal) {
        User user = getUserFromPrincipal(principal);
        return snippetRepository.searchSnippets(user.getId(), language, keyword).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private User getUserFromPrincipal(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    private SnippetResponse mapToResponse(Snippet snippet) {
        return SnippetResponse.builder()
                .id(snippet.getId())
                .title(snippet.getTitle())
                .content(snippet.getContent())
                .language(snippet.getLanguage())
                .createdAt(snippet.getCreatedAt())
                .tags(snippet.getTags().stream().map(Tag::getName).collect(Collectors.toSet()))
                .build();
    }
}