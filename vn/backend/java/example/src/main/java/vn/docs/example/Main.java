package vn.docs.example;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Minh họa Java: Collections, Stream API, Lambda — tài liệu Backend Java.
 */
public class Main {

    public static void main(String[] args) {
        // Collections & Stream
        List<String> names = List.of("An", "Bình", "Chi", "Dũng");
        List<String> filtered = names.stream()
                .filter(s -> s.length() > 2)
                .map(String::toUpperCase)
                .collect(Collectors.toList());
        System.out.println("Stream filter+map: " + filtered);

        // Optional
        String first = names.stream().findFirst().orElse("(empty)");
        System.out.println("Optional findFirst: " + first);

        // Grouping
        Map<Integer, List<String>> byLength = names.stream()
                .collect(Collectors.groupingBy(String::length));
        System.out.println("Group by length: " + byLength);
    }
}
