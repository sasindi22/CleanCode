package com.system.cleancode.repository;

import com.system.cleancode.entity.Snippet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SnippetRepository extends JpaRepository<Snippet, Long> {
    List<Snippet> findByUserId(Long userId);

    @Query("SELECT DISTINCT s FROM Snippet s JOIN s.tags t WHERE s.user.id = :userId " +
            "AND (:language IS NULL OR s.language = :language) " +
            "AND (:keyword IS NULL OR s.title LIKE %:keyword% OR s.content LIKE %:keyword% OR t.name = :keyword)")
    List<Snippet> searchSnippets(@Param("userId") Long userId, @Param("language") String language, @Param("keyword") String keyword);
}
