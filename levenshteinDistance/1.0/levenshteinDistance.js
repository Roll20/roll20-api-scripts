/**
 * Compares two strings and returns the number of changes (substitutions,
 * insertions, and deletions) required to move from the first string to the
 * second.
 */
var bshields = bshields || {};
bshields.levenshteinDistance = (function() {
    'use strict';
    
    var version = 1.0;
    
    function levenshteinDistance(a, b) {
        var i, j,
            matrix = [];
        
        if (a.length === 0) {
            return b.length;
        }
        if (b.length === 0) {
            return a.length;
        }
        
        // Increment along the first column of each row
        for (i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        
        // Increment each column in the first row
        for (j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
 
        // Fill in the rest of the matrix
        for (i = 1; i <= b.length; i++) {
            for (j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // Substitution
                                   Math.min(matrix[i][j - 1] + 1,     // Insertion
                                            matrix[i - 1][j] + 1));   // Deletion
                }
            }
        }
        
        return matrix[b.length][a.length];
    }
    
    return levenshteinDistance;
}());